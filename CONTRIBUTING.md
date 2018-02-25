# Contribution Guide

## Issue
* Please search and register if you already have the issue you want to create. If you have a similar issue, you can add additional comments.
* Please write a problem or suggestion in the issue. Never include more than one item in an issue.
* Please be as detailed and concise as possible.
	* If necessary, please take a screenshot and upload an image.

## Pull request(PR)
* Do not modify the code in the `master` branch.
* PR allows only the `dev` branch.
* It is useful to use a topic branch that has the parent `dev` as its parent.


## Coding Guidelines
Please follow the Coding conventions as much as possible when contributing your code.
* The indent tab is two spaces.
* The class declaration and the `{}` in curly brackets such as function, if, foreach, for, and while should be in the following format. Also if you installed eslint in vscode or in your code editor, it will help you with linting.
	* `{` should be placed in same line and `}` should be placed in next line.
```
for (let i = 0; i < 10; i++) {
  ...
}
array.forEach((e) => {
  ...
});
```
  * Space before `(` and after `)`.
* **If you find code that does not fit in the coding convention, do not ever try to fix code that is not related to your purpose.**
