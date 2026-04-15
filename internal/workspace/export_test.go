package workspace

func EditFileUnderRootForTest(root, rel, oldString, newString string) (string, error) {
	return editFileUnderRoot(root, rel, oldString, newString)
}
