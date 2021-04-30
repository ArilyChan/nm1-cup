<template>
  <div class="pt-2">
    <div v-for="map in maps" :key="map.id">
      <div class="text-center">
        <img :src="map.beatmapset.covers.card" alt="">
        <div>
          <div>{{ map.beatmapset.artist }} - {{ map.beatmapset.title }}</div>
          <div>{{ map.version }}</div>
          <div>bid: {{ map.id }}</div>
        </div>
      </div>
      <hr>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ $axios, params }) {
    return {
      maps: await $axios.get(`/api/tournament/${params.tournament}/pool`).then(res => res.data)
    }
  }
}
</script>
