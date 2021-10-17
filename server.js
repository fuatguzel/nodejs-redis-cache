const express = require('express')
const axios = require('axios')
const redis = require('redis')

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.REDIS_PORT || 6379

const client = redis.createClient(REDIS_PORT)

const app = express()

const setResponse = (username, followers) => {
  return `<h2>${username} has ${followers} followers.</h2>`
}

const getUserInfo = async (req, res, next) => {
  try {
    const {username} = req.params
    const response = await axios(`https://api.github.com/users/${username}`)

    const followers = response.data.followers

    // Set data to Redis
    client.setex(username, 60, followers)

    res.send(setResponse(username, followers))
  } catch (error) {
    console.error(error)
    res.status(500)
  }
}

// Cache middleware
function cache(req, res, next) {
  const {username} = req.params

  client.get(username, (err, data) => {
    if(err) throw err

    if(data !== null) res.send(setResponse(username, data))
    else next()
  })
}


// Routes
app.get('/infos/:username', cache, getUserInfo)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})