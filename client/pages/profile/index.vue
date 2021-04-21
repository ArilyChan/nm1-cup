<template>
  <div>redirecting to user profile</div>
</template>
<script>
export default {
  middleware: 'auth'
  // fetch ({ redirect, store, params }) {
  //   if (store.state.auth.user.id) { redirect({ name: 'tournament-users-id', params: { id: store.state.auth.user.id, tournament: params.tournament } }) }
  // }
}
</script>
