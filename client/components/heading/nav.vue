<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand v-if="$store.state.tournament.slug" :to="{name:'tournament', params: {tournament: $store.state.tournament.slug}}">
      {{ $store.state.tournament.name }}
    </b-navbar-brand>
    <b-navbar-brand v-else :to="{name:'index'}">
      battle royale tournament
    </b-navbar-brand>
    <b-navbar-nav class="ml-auto">
      <b-nav-item-dropdown v-if="$store.state.auth.user" right>
        <!-- Using 'button-content' slot -->
        <template #button-content>
          <b-avatar :src="$store.state.auth.user.avatar_url" size="sm" />
        </template>
        <b-dropdown-item :to="{name: 'profile'}">
          Profile
        </b-dropdown-item>
        <b-dropdown-item href="/logout">
          Sign Out
        </b-dropdown-item>
      </b-nav-item-dropdown>
      <template v-else>
        <b-nav-item :to="{name: 'OAuth-require'}">
          Login from osu
        </b-nav-item>
        <b-nav-item>
          Login as manager
        </b-nav-item>
      </template>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
export default {
}
</script>
