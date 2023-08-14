<template>
  <v-container>
    <v-card>
      <v-card-title>¡Tasks!</v-card-title>
      <v-col class="d-flex justify-end">
        <v-btn @click="dialog = true; newform()" rounded outlined color="blue">Agregar</v-btn>
      </v-col>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>Nueva Tarea</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field label="Titulo" v-model="title" :rules="[requiredRule]" :error-messages="titleError"></v-text-field>
              <v-text-field label="Descripción" v-model="description"></v-text-field>
              <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                  v-model="due_date"
                  label="Fecha limite (YYYY-MM-DD)"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[requiredRule]"
                  :error-messages="dueDateError">
                  </v-text-field>
                </template>
                <v-date-picker v-model="due_date" :min="minDate" @input="menu = false"></v-date-picker>
              </v-menu>
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
      <v-dialog v-model="confirmDg" max-width="290">
        <v-card>
          <v-card-title class="headline">¿Estas seguro de eliminar esta tarea?</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="confirmDg = false">Cancelar</v-btn>
            <v-btn color="green darken-1" text @click="confirmDelete">Si</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-container>
        <v-row>
          <v-col class="blue lighten-2, column-spacing" @dragover.prevent="allowDrop" @drop="dropToDo">
            <h1>To Do</h1>
            <v-card v-for="task in tareastoDo" :key="task.id" class="white , task" draggable="true" @dragstart="dragStart(task)">
              <v-card-title class="purple lighten-3">{{ task.title }}</v-card-title>
              <v-card-text class="black-text2">{{ task.due_date }}</v-card-text>
              <v-card-text class="black-text2">No completada</v-card-text>
              <v-card-actions>
                <v-btn @click="updateTask(task)" class="card-actions-icons"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn @click="deleteTask(task.id)" ><v-icon color="red">mdi-delete</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col class="green lighten-2, column-spacing" @dragover.prevent="allowDrop" @drop="dropDone">
            <h1>Done</h1>
            <v-card v-for="task in tareasDone" :key="task.id" class="white , task" draggable="=true" @dragstart="dragStart(task)">
              <v-card-title class="orange lighten-1">{{ task.title }}</v-card-title>
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
      task: null,
      confirmDg: false,
      taskIdDelete: null,
      requiredRule: [v => !!v || 'Este campo es obligatorio'],
      titleError: '',
      dueDateError: '',
      draggedTask: null,
      minDate: new Date().toISOString().substr(0, 10)
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
      if (!this.title) {
        this.titleError = 'El título es obligatorio'
        return
      } else {
        this.titleError = ''
      }
      if (!this.due_date) {
        this.dueDateError = 'La fecha límite es obligatoria'
        return
      } else {
        this.dueDateError = ''
      }
      console.log(taskData)
      try {
        let response

        if (this.task && this.task.id) {
          response = await datatask.update(this.task.id, taskData)
        } else {
          response = await datatask.create(taskData)
        }
        console.log('Respuesta del servidor: ', response)
        if (response.status === 201 || response.status === 200) {
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
    deleteTask (id) {
      this.taskIdDelete = id
      this.confirmDg = true
    },
    async confirmDelete () {
      this.confirmDg = false
      try {
        const response = await datatask.delete(this.taskIdDelete)
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
      this.task = null
      this.title = ''
      this.description = ''
      this.due_date = null
      this.comments = ''
      this.is_completed = null
      this.tags = ''
    },
    dragStart (task) {
      this.draggedTask = task
    },
    allowDrop (event) {
      event.preventDefault()
    },
    dropToDo () {
      if (this.draggedTask) {
        this.draggedTask.is_completed = 1
        this.updateDragged()
      }
    },
    dropDone () {
      if (this.draggedTask) {
        this.draggedTask.is_completed = 0
        this.updateDragged()
      }
    },
    async updateDragged () {
      this.task = this.draggedTask
      await this.submitForm()
      this.draggedTask = null
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
