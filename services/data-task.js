import http from './endpoints_common.js'

class Datatask {
  getAll () {
    return http.get('/tasks')
  }

  get (id) {
    return http.get(`tasks/${id}`)
  }

  create (data) {
    const formData = new URLSearchParams()
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
    return http.post('/tasks', formData)
  }
}

export default new Datatask()
