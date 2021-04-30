<template>
  <b-navbar toggleable="lg" variant="primary" type="dark">
    <b-navbar-brand :to="{name:'index'}">
      osu tournament
    </b-navbar-brand>
    <b-navbar-nav>
      <b-nav-item-dropdown v-if="$store.state.tournament.slug">
        <template #button-content>
          {{ $store.state.tournament.name }}
        </template>
        <b-dropdown-item :to="{name:'tournament', params: {tournament: $store.state.tournament.slug}}">
          index
        </b-dropdown-item>
        <b-dropdown-item :to="{name:'tournament-pool', params: {tournament: $store.state.tournament.slug}}">
          pool
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
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
