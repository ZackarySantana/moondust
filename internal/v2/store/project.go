package store

type Project struct {
}

type ProjectStore interface {
	Store[Project]
}
