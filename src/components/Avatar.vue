<template>
    <div v-if="username || avatar" class="avatar">
        <q-avatar size="50px">
            <img :src="avatar || defaultSrcImage">
        </q-avatar>
        <span class="avatar__username">{{username}}</span>
    </div>
</template>

<script lang="ts">
    import { defineComponent, ref } from 'vue';

    export default defineComponent({
        name: 'Avatar.vue',
        setup() {
            const defaultSrcImage = ref('https://cdn.quasar.dev/img/avatar.png');
            return {
                defaultSrcImage,
            };
        },

        props: {
            username: String,
            avatar: String,
        }
    });
</script>

<style lang="scss" scoped>
    .avatar {
        max-width: 300px;
        cursor: pointer;

        &__username {
            font-size: 20px;
            margin-left: 20px;
            word-break: break-all;
        }
    }
</style>
