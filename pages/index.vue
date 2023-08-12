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
            <!-- <v-card>
              <v-card-title>To Do</v-card-title>
            </v-card> -->
          </v-col>
          <v-col class="orange lighten-2, column-spacing">
            <h1>Doing</h1>
            <!-- <v-card>
              <v-card-title>Doing</v-card-title>
            </v-card>-->
          </v-col>
          <v-col class="green lighten-2, column-spacing">
            <h1>Done</h1>
            <!-- <v-card>
              <v-card-title>Done</v-card-title>
            </v-card>-->
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
      tasks: []
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
        const response = await datatask.create(taskData)
        if (response.status === 201) {
          console.log('Tarea Agregada con éxito', response.data)
        } else {
          console.error('Error al agregar la tarea', response.data)
        }
      } catch (error) {
        console.error('Hubo un detalle al agregar la tarea', error)
      }
    }
  },
  name: 'IndexPage'
}
</script>
<style>
.column-spacing {
  margin-right: 20px;
}
</style>
