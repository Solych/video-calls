<template>
    <q-toolbar class="toolbar bg-primary text-white">
        <q-toolbar-title>WebRTC usage</q-toolbar-title>
        <q-btn class="toolbar__button"
               text-color="black"
               @click="isWantConnect = true"
               color="white">Connect
        </q-btn>
        <div @click="routeToSettings()"
             class="toolbar__avatar">
            <Avatar :avatar="avatar"
                    :username="username"/>
        </div>

        <q-dialog v-model="isWantConnect">
            <q-card class="modal">
                <q-card-section>
                    <div class="text-h6">Connecting to a room</div>
                </q-card-section>

                <div class="modal__input">
                    <q-card-section class="q-pt-none">
                        <q-input outlined
                                 v-model="roomNumber"
                                 label="Input a room number"/>
                    </q-card-section>
                </div>

                <div class="modal__approve-button">
                    <q-card-actions align="right">
                        <q-btn color="primary"
                               @click="routeToLobby()"
                               :disabled="!roomNumber"
                               v-close-popup
                               label="Connect"/>
                    </q-card-actions>
                </div>
            </q-card>
        </q-dialog>

    </q-toolbar>
</template>

<script lang="ts">
    import Avatar from './Avatar.vue';
    import { defineComponent, onMounted, onBeforeMount, ref } from 'vue';
    import emitter from '@/service/emitter';
    import router from '@/router';

    export default defineComponent({
        name: 'Header.vue',
        components: {
            Avatar,
        },

        setup() {
            let db = <IDBDatabase><unknown>ref();
            let username = ref(null);
            let avatar = ref(null);
            let isWantConnect = ref(false);
            let roomNumber = ref(null);

            const routeToSettings = () => router.push('/settings');

            const routeToLobby = () => router.push({ name: 'conference', params: { id: roomNumber.value }});

            const loadInfoFromDb = () => {
                const openDB = indexedDB.open('webrtc', 1);

                openDB.onupgradeneeded = () => {
                    db = openDB.result;
                    if (!db.objectStoreNames.contains('userInfo')) {
                        db.createObjectStore('userInfo', { keyPath: 'id' });
                    }
                };

                openDB.onsuccess = () => {
                    db = openDB.result;
                    if (db.objectStoreNames.contains('userInfo')) {
                        const all = db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                        all.onsuccess = () => {
                            const result = all.result[0];
                            username.value = result?.username;
                            avatar.value = result?.picture;
                        };
                    }
                };
            };

            onBeforeMount(() => loadInfoFromDb()) ;

            onMounted(() => emitter.on('isShouldUpdateInfo', () => loadInfoFromDb()));

            return {
                username,
                avatar,
                isWantConnect,
                roomNumber,

                routeToSettings,
                routeToLobby,
            };
        },

    });
</script>

<style lang="scss" scoped>
    .toolbar {
        padding: 12px 8px;

        &__button {
            margin-right: 20px;
        }

        &__avatar {
            margin-left: 24px;

            @media (max-width: 400px) {
                display: none;
            }
        }
    }

    .modal {
        width: 700px;
        max-width: 80vw;

        &__input {
            max-width: 300px;
        }

        &__approve-button {
            margin: 8px;
        }
    }
</style>
