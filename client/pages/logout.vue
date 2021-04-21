<template>
  <div>bye</div>
</template>
<script>
export default {
  asyncData ({ $auth, redirect }) {
    return $auth.logout()
  }
}
</script>
