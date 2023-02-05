package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/petderek/dflag"
)

var flags = struct {
	Address  string `value:"127.0.0.1:8000"`
	MaxBytes int    `value:"4096"`
}{}

var store Store = &MemStore{
	DB: make(map[string]Item),
}

func main() {
	_ = dflag.Parse(&flags)

	mux := http.NewServeMux()
	srv := &http.Server{
		Addr:              flags.Address,
		Handler:           mux,
		ReadTimeout:       5 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      30 * time.Second, // allow long polling
		IdleTimeout:       0,                // default readtimeout
		MaxHeaderBytes:    0,                // default to golang max
		TLSConfig:         nil,              // not terminating TLS in app
		TLSNextProto:      nil,              // ^
		ConnState:         nil,
		ErrorLog:          nil, // default to std logger
		BaseContext:       nil, // default to background
		ConnContext:       nil, // default to basecontext
	}

	mux.HandleFunc("/item/", handleItem)
	log.Println(srv.ListenAndServe())
}

func handleItem(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		acceptPost(w, r)
	//case http.MethodHead:
	//	acceptHead(w, r)
	case http.MethodGet:
		acceptGet(w, r)
	default:
		reject(w, http.StatusMethodNotAllowed)
	}
}

func acceptPost(w http.ResponseWriter, r *http.Request) {
	if err := authn(r); err != nil {
		log.Println("rejecting due to authn failure: ", err)
		reject(w, http.StatusUnauthorized)
		return
	}

	itemId := extractItem(r.URL)
	item, err := store.Get(itemId)
	if err != nil {
		log.Println("rejecting due to db failure: ", err)
		reject(w, http.StatusInternalServerError)
		return
	}

	if err := authz(item, r); err != nil {
		log.Println("rejecting due to authz failure: ", err)
		reject(w, http.StatusUnauthorized)
		return
	}

	newItem, err := itemFromRequest(r)
	if err != nil {
		log.Println("rejecting due to bad request: ", err)
		reject(w, http.StatusBadRequest)
		return
	}

	// at this point we are auth'd and have two conflicting items. check etags
	replace := false
	switch {
	case item.ID == "": // item not set yet
		replace = true
	case newItem.Metadata.Etag == item.Metadata.Etag:
		replace = true
	}

	if !replace {
		log.Printf("rejecting due to mismatched etags: %s and %s\n", item.Metadata.Etag, newItem.Metadata.Etag)
		reject(w, http.StatusPreconditionFailed)
		return
	}

	if err = store.Put(itemId, newItem); err != nil {
		log.Println("failed to store item: ", err)
		reject(w, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func acceptHead(w http.ResponseWriter, r *http.Request) {
	// TODO: fix
	acceptGet(w, r)
}

func acceptGet(w http.ResponseWriter, r *http.Request) {
	longPoll := false
	itemId := extractItem(r.URL)
	item, err := store.Get(itemId)
	if err != nil {
		log.Println("unable to load from database: ", err)
		reject(w, http.StatusInternalServerError)
		return
	}
	if item.Envelope == nil {
		reject(w, http.StatusNotFound)
		return
	}

	etag := r.Header.Get("If-None-Match")
	switch {
	case etag == item.Metadata.Etag:
		break
	case !longPoll:
		reject(w, http.StatusNotModified)
		return
	case longPoll:
		// todo
		break
	}

	w.WriteHeader(http.StatusOK)
	writeItem(w, item)
}

var (
	cannedResponses = map[int]json.RawMessage{
		http.StatusOK:                  json.RawMessage(`{}`),
		http.StatusMethodNotAllowed:    json.RawMessage(`{"error":"not allowed"}`),
		http.StatusInternalServerError: json.RawMessage(`{"error":"internal server error"}`),
	}
)

func reject(w http.ResponseWriter, code int) {
	res, ok := cannedResponses[code]
	if !ok {
		log.Println("no canned message for error code: ", code)
		code = 500
		res = cannedResponses[500]
	}
	w.WriteHeader(code)
	_, err := w.Write(res)
	errlog(err)
}
func errlog(err error) {
	if err != nil {
		log.Println("non-crticial error detected: " + err.Error())
	}
}

func extractItem(u *url.URL) string {
	if u == nil {
		return ""
	}
	for i, t := range strings.Split(u.Path, "/") {
		switch {
		case t == "item":
			continue
		case t == "" && i == 0:
			continue
		default:
			return t
		}
	}
	return ""
}

// Item is an object that contains an ID and a bag of json properties eg:
// ```
//
//	{
//	  "id": "foo",
//	  "envelope": {
//	    "stuff":"anything"
//	  }
//	}
//
// ```
type Item struct {
	ID       string
	Envelope *json.RawMessage
	Metadata ItemMetadata
}

type ItemMetadata struct {
	Owner        string
	ModifiedTime time.Time
	Etag         string
}

type Store interface {
	Get(string) (Item, error)
	Put(string, Item) error
}

type MemStore struct {
	DB map[string]Item
}

func (m *MemStore) Get(s string) (Item, error) {
	i, ok := m.DB[s]
	if !ok {
		return Item{}, nil
	}
	return i, nil
}

func (m *MemStore) Put(s string, i Item) error {
	m.DB[s] = i
	return nil
}

func authn(r *http.Request) error {
	return nil
}

func authz(item Item, r *http.Request) error {
	return nil
}

func itemFromRequest(r *http.Request) (Item, error) {
	var item Item
	item.ID = extractItem(r.URL)
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return item, err
	}
	if item.Envelope == nil {
		item.Envelope = &json.RawMessage{}
	}
	if err := json.Unmarshal(body, item.Envelope); err != nil {
		return item, err
	}

	item.Metadata.Etag = r.Header.Get("If-Match")
	return item, nil
}

func writeItem(w http.ResponseWriter, item Item) error {
	_, err := w.Write(*item.Envelope)
	return err
}
