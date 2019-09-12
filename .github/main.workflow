workflow "New workflow" {
  on = "push"
  resolves = ["Setup Node.js for use with actions"]
}

action "Setup Node.js for use with actions" {
  uses = "actions/setup-node@v1"
  runs = "npm install"
}
