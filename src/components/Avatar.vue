<template>
    <div v-if="nickName || avatar" class="avatar">
        <q-avatar size="50px">
            <img :src="avatar || defaultSrcImage">
        </q-avatar>
        <span class="avatar__nickname">{{nickName}}</span>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    export default defineComponent( {
        name: "Avatar.vue",
        data() {
            return {
                defaultSrcImage: 'https://cdn.quasar.dev/img/avatar.png',
            }
        },

        props: {
            nickName: String,
            avatar: String,
        }
    })
</script>

<style lang="scss" scoped>
    .avatar {
        max-width: 300px;
        cursor: pointer;
        &__nickname {
            font-size: 20px;
            margin-left: 20px;
            word-break: break-all;
        }
    }
</style>
