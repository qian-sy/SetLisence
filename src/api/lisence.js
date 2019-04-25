import axios from 'axios'

const createLisence = data =>
  axios.post('/api/v1/lisences', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

const FetchDownLoadUrl = url =>
  axios.get(`/api/v1/lisence/download?url=${url}`, url, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export {
  createLisence,
  FetchDownLoadUrl
}
