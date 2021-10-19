const express = require('express')
const axios = require('axios')
const redis = require('redis')
const responseTime = require('response-time')
const {
  promisify
} = require('util')

const PORT = process.env.PORT || 5000
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = process.env.REDIS_PORT || 6379

const app = express()
app.use(responseTime())

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT
})

const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

const getUserRepos = async (req, res, next) => {
  try {
    const {
      username
    } = req.params

    const reply = await GET_ASYNC(`repos-${username}`)
    if (reply) {
      console.log("using cache for all repo infos");
      res.send(JSON.parse(reply))
      return
    }

    const response = await axios(`https://api.github.com/users/${username}/repos`)

    const saveResponse = await SET_ASYNC(`repos-${username}`, JSON.stringify(response.data), 'EX', 10)
    console.log("new all repo infos add to cache");
  } catch (error) {
    console.error(error)
    res.status(500)
  }
}

const getSingleRepoOfUser = async (req, res, next) => {
  try {
    const {
      username,
      repositoryname
    } = req.params

    const reply = await GET_ASYNC(`${username}-${repositoryname}`)
    if (reply) {
      console.log("using cache for single repo infos");
      res.send(JSON.parse(reply))
      return
    }

    const response = await axios(`https://api.github.com/repos/${username}/${repositoryname}`)

    const saveResponse = await SET_ASYNC(`${username}-${repositoryname}`, JSON.stringify(response.data), 'EX', 10)
    console.log("new single repo infos add to cache");
  } catch (error) {
    console.error(error)
    res.status(500)
  }
}

// Routes
app.get('/repos/:username', getUserRepos)
app.get('/repos/:username/:repositoryname', getSingleRepoOfUser)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})