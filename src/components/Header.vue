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
            <Avatar :avatar="this.avatar"
                    :nickName="this.nickName"/>
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

<script>
    import Avatar from './Avatar.vue';

    export default {
        name: "Header.vue",
        components: {
            Avatar,
        },

        created() {
            this.loadInfoFromDb();
        },

        methods: {
            routeToSettings() {
                this.$router.push('/settings');
            },

            loadInfoFromDb() {
                const openDB = indexedDB.open('webrtc', 1);

                openDB.onupgradeneeded = () => {
                    this.db = openDB.result;
                    if (!this.db.objectStoreNames.contains('userInfo')) {
                        this.db.createObjectStore('userInfo', {keyPath: 'id'});
                    }
                };

                openDB.onsuccess = () => {
                    this.db = openDB.result;
                    if (this.db.objectStoreNames.contains('userInfo')) {
                        const all = this.db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                        all.onsuccess = () => {
                            const result = all.result[0];
                            this.nickName = result?.nickName;
                            this.avatar = result?.picture;
                        };
                    }
                    
                };
            },

            routeToLobby() {
                this.$router.push({
                    name: 'conference',
                    params: {id: this.roomNumber}
                });
            }
        },

        mounted() {
            this.emitter.on("isShouldUpdateInfo", () => this.loadInfoFromDb());
        },

        data() {
            return {
                db: null,
                nickName: '',
                avatar: '',
                isWantConnect: false,
                roomNumber: '',
            };
        }
    }
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
