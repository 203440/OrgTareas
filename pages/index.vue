<template>
  <v-container>
    <v-card>
      <v-card-title>¡Tasks!</v-card-title>
      <v-col class="d-flex justify-end">
        <v-btn @click="dialog = true" rounded outlined color="blue">Agregar</v-btn>
      </v-col>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>Nueva Tarea</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field label="Titulo" v-model="title"></v-text-field>
              <v-text-field label="Descripción" v-model="description"></v-text-field>
              <v-text-field label="Fecha limite (YYYY-MM-DD)" v-model="due_date"></v-text-field>
              <v-text-field label="Comentarios" v-model="comments"></v-text-field>
              <v-radio-group v-model="is_completed" row>
                <v-label>¿Tarea ya realizada?</v-label>
                <v-radio label="Sí" value=0></v-radio>
                <v-radio label="No" value=1></v-radio>
              </v-radio-group>
              <v-text-field label="Tags" v-model="tags"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="submitForm">Agregar</v-btn>
        </v-card-actions>
        </v-card>
      </v-dialog>
      <v-container>
        <v-row>
          <v-col class="blue lighten-2, column-spacing">
            <h1>To Do</h1>
            <v-card v-for="task in tareastoDo" :key="task.id" class="white , task">
              <v-card-title class="purple lighten-3">{{ task.title }}</v-card-title>
              <v-card-text class="black-text2">{{ task.due_date }}</v-card-text>
              <v-card-text class="black-text2">No completada</v-card-text>
              <v-card-actions>
                <v-btn @click="updateTask(task)" class="card-actions-icons"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn @click="deleteTask(task.id)" ><v-icon color="red">mdi-delete</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <!-- <v-col class="orange lighten-2, column-spacing">
            <h1>Doing</h1>
            <v-card>
              <v-card-title>Doing</v-card-title>
            </v-card>
          </v-col>-->
          <v-col class="green lighten-2, column-spacing">
            <h1>Done</h1>
            <v-card v-for="task in tareasDone" :key="task.id" class="white , task">
              <v-card-title class="purple lighten-3">{{ task.title }}</v-card-title>
              <v-card-text class="black-text2">{{ task.due_date }}</v-card-text>
              <v-card-text class="black-text2">Completada</v-card-text>
              <v-card-actions>
                <v-btn @click="updateTask(task)" class="card-actions-icons"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn @click="deleteTask(task.id)"><v-icon color="red">mdi-delete</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import datatask from '../services/data-task.js'

export default {
  data () {
    return {
      dialog: false,
      menu: false,
      title: '',
      is_completed: null,
      due_date: null,
      comments: '',
      description: '',
      tags: '',
      tasks: [],
      task: null
    }
  },
  async mounted () {
    try {
      const response = await datatask.getAll()
      if (response.status === 200) {
        this.tasks = response.data
      }
    } catch (error) {
      console.error('Error al recuperar las tareas', error)
    }
  },
  computed: {
    tareastoDo () {
      return this.tasks.filter(task => task.is_completed === 1)
    },
    tareasDone () {
      return this.tasks.filter(task => task.is_completed === 0)
    }
  },
  methods: {
    async submitForm () {
      const taskData = {
        token: '',
        title: this.title,
        is_completed: this.is_completed,
        due_date: this.due_date,
        description: this.description,
        comments: this.comments,
        tags: this.tags
      }
      console.log(taskData)
      try {
        let response

        if (this.task && this.task.id) {
          response = await datatask.update(this.task.id, taskData)
        } else {
          response = await datatask.create(taskData)
        }
        if (response.status === 201) {
          console.log('Tarea Guardada con éxito', response.data)
          this.dialog = false
          this.refreshTasks()
        } else {
          console.error('Error al Guardar la tarea', response.data)
        }
      } catch (error) {
        console.error('Hubo un detalle al Guardar la tarea', error)
      }
    },
    async deleteTask (id) {
      try {
        const response = await datatask.delete(id)
        if (response.status === 200) {
          console.log('Se elimino con exito la tarea')
          await this.refreshTasks()
          this.$forceUpdate()
        }
      } catch (error) {
        console.error('Hubo un detalle al eliminar la tarea', error)
      }
    },
    async refreshTasks () {
      try {
        const response = await datatask.getAll()
        if (response.status === 200) {
          this.tasks = response.data
        }
      } catch (error) {
        console.error('Error al recuperar las tareas', error)
      }
    },
    updateTask (task) {
      this.dialog = true
      this.task = task
      this.title = task.title
      this.description = task.description
      this.due_date = task.due_date
      this.comments = task.comments
      this.is_completed = task.is_completed
      this.tags = task.tags
    },
    newform () {
      this.title = ''
      this.description = ''
      this.due_date = null
      this.comments = ''
      this.is_completed = null
      this.tags = ''
    }
  },

  name: 'IndexPage'
}
</script>
<style>
.column-spacing {
  margin-right: 20px;
}
.card-actions-icons {
  position: absolute;
  bottom: 10px;
  right: 0;
  background: rgba(255, 255, 255, 0.7);
}
.black-text2 {
  color: black!important;
}
.task{
  margin-bottom: 15px;
}
</style>
