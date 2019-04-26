import axios from 'axios'

const createLisence = data =>
  axios.post('/api/v1/lisences', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export {
  createLisence
}
