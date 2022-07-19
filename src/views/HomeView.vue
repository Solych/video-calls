<template>
    <form class="home">
        <div class="home__description">Video calls</div>
        <div class="home__item">
            <q-input outlined
                     v-model="username"
                     label="Login as..."/>
        </div>
        <div class="home__item">
            <q-input outlined
                     v-model="room"
                     label="Join to the room number..."/>
        </div>
        <div class="home__item">
            <q-btn color="black"
                   @click="join()"
                   :disabled="!username || !room"
                   label="Login"/>
        </div>
    </form>
</template>

<script lang="ts">
    import { defineComponent, ref, onBeforeMount } from 'vue';
    import router from '@/router';
    import emitter from '@/service/emitter';

    export default defineComponent({
        name: 'HomeView.vue',

        setup() {
            let username = ref(null);
            let room = ref(null);
            let db = <IDBDatabase><unknown>ref();
            let userId = ref(null);

            const loadUsername = () => {
                if (db.objectStoreNames.contains('userInfo')) {
                    const all = db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                    all.onsuccess = () => {
                        const result = all.result[0];
                        username.value = result?.username;
                        userId.value = result?.id;
                    };
                }
            };

            const join = () => {
                const object = {
                    id: Math.round(Math.random() * 100000),
                    username: username.value,
                    picture: null,
                };

                const data = db.transaction('userInfo', 'readwrite').objectStore('userInfo');
                if (userId.value) {
                    data.delete(<IDBValidKey><unknown>userId.value);
                }

                data.add(object);
                emitter.emit('isShouldUpdateInfo');
                router.push({
                    name: 'conference',
                    params: { id: room.value }
                });
            };

            onBeforeMount(() => {
                const openDB = indexedDB.open('webrtc', 1);
                openDB.onsuccess = () => {
                    db = openDB.result;
                    loadUsername();
                };
            });

            return {
                username,
                room,

                join
            };
        },
    });
</script>

<style lang="scss" scoped>
    .home {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        justify-content: space-around;
        flex-direction: column;
        height: 350px;
        display: flex;
        padding: 8px;
        max-width: 400px;
        align-items: center;
        border: 2px solid gray;
        border-radius: 8px;
        width: 80%;

        &__item {
            width: 90%;
        }

        &__description {
            font-size: 20px;
        }
    }
</style>
