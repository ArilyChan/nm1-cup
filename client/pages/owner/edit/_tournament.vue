<template>
  <b-container fluid="md" class="py-4">
    <b-row>
      <b-col>
        <b-overlay>
          <template #overlay>
            upload result: {{ uploadResult }}
          </template>
          <b-card class="shadow" no-body>
            <b-card-header>you are editing: {{ slug }}</b-card-header>
            <vue-json-editor v-model="tournament" class="mh-500px" />
            <b-card-footer>
              <b-button-toolbar>
                <b-button-group size="sm">
                  <b-button variant="danger" @click="updateTournament">
                    save
                  </b-button>
                  <b-button variant="warning" @click="reload">
                    reload
                  </b-button>
                </b-button-group>
              </b-button-toolbar>
            </b-card-footer>
          </b-card>
        </b-overlay>
      </b-col>
    </b-row>
    <b-row class="pt-4">
      <b-col>
        <b-card class="shadow">
          <div>
            time to dateString
            <b-input v-model="dateTime" />
            <div>= {{ new Date(Date.parse(dateTime) || 0).toISOString() }}</div>
            <b-button @clear="dateTime = null">
              clear
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="pt-4">
      <b-col>
        <b-card class="shadow" no-body>
          <b-list-group flush>
            <b-list-group-item>name: nm1-cup for now</b-list-group-item>
            <b-list-group-item>start: Date, start date</b-list-group-item>
            <b-list-group-item>end: Date, end date</b-list-group-item>
            <b-list-group-item>dailyEloMargin: Number, daily incremental required margin from start</b-list-group-item>
          </b-list-group>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
async function load ($axios, t) {
  let tournament = await $axios.get(`/api/tournament/${t}/database`).then(res => res.data)
  if (!tournament.slug) {
    tournament = {
      ...tournament,
      slug: t,
      name: 'change me'
    }
  }
  return { tournament }
}
export default {
  async asyncData ({ $axios, params }) {
    const result = await load($axios, params.tournament)
    return {
      ...result,
      slug: params.tournament
    }
  },
  data () {
    return {
      uploadResult: {},
      uploaded: false,
      dateTime: null
    }
  },
  methods: {
    async updateTournament () {
      const game = await this.$axios.post(`/api/tournament/${this.slug}/game`, this.tournament).then(res => res.data)
      this.uploadResult = game
      // const statistics = await this.$axios.post(`/api/tournament/${this.slug}/statistics`, this.tournament.statistics).then(res => res.data)
      // this.uploadResult.statistics = statistics
      this.uploaded = true
    },
    async reload () {
      this.tournament = await (await load(this.$axios, this.slug)).tournament
    }
  }

}
</script>

<style lang="scss">
.jsoneditor-vue{
    min-height: 500px;
    height: 500px;
    height: 100%;
    overflow: visible;
}
.mh-500px {
  height: 500px;
}
</style>
