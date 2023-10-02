const express = require('express')
const bp = require('body-parser')
const app = express()
const fetch = require('node-fetch')

const WEBHOOK_URL = 'https://hooks.slack.com/services/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'

app.use(bp.json())

app.get('/', (req, res) => {
  res.send('hello world')
})

app.post('/pr-comments', (req, res) => {
  // other actions are 'edited' and 'deleted'. We don't care about those two for now.
  // There was somehow a way to strikethrough out the message in slack (if the delete event occurred) or edit the slack message (if the comment was edited) 
  // Rather than giving the user another notification, which was also nice. Not too concerned about getting that behavior right now though. 
  if (req.body.action === 'created') {
    const pull_request = req.body.comment
    const prReviewId = pull_request.pull_request_review_id
    const prNumber = pull_request.number
    const prLink = `https://github.com/LukeDasios/slack-bot-test-repo/pull/${prNumber}/#pullrequestreview-${prReviewId}`
    const user = req.body.sender.login
    const comment = pull_request.body
    const branchName = req.body.pull_request.head.ref

    const message = `*${user}* commented "_${comment}_" on <${prLink}|${branchName}>`

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: message})
    }

    fetch(WEBHOOK_URL, options).then().catch(err => console.error(err))

    return res.send('Working')
  } 
})

app.post('/pr-status', (req, res) => {
  console.log(req.body)

  const state = req.body.review.state

  if (state != 'commented') {
    const comment = req.body.review.body
    const user = req.body.sender.login
    const branchName = req.body.pull_request.head.ref
    const prReviewId = req.body.pull_request.id
    const prNumber = req.body.pull_request.number
    const prLink = `https://github.com/LukeDasios/slack-bot-test-repo/pull/${prNumber}/#pullrequestreview-${prReviewId}`
    const message = `*${user}* ${state} <${prLink}|${branchName}> with comment ${comment ? `_"${comment}"_` : ""}`

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: message})
    }

    fetch(WEBHOOK_URL, options).then().catch(err => console.error(err))

    return res.send('Working')
  }

})

app.listen(8080, () => {
  console.log("Server is running on port 8080")
})