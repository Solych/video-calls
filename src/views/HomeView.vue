<template>
    <div class="home">
        <div class="home__description">Video calls</div>
        <div class="home__input">
            <q-input outlined
                     v-model="nickName"
                     label="Login as..."/>
        </div>
        <div class="home__input">
            <q-input outlined
                     v-model="existedRoom"
                     label="Join to the room number..."/>
        </div>
        <div class="home__input">
            <q-btn color="black"
                   @click="join()"
                   :disabled="!nickName || !existedRoom"
                   label="Login"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: "HomeView.vue",
        created() {
            const openDB = indexedDB.open('webrtc', 1);

            openDB.onsuccess = () => {
                this.db = openDB.result;
                this.loadNickName();
            }
        },

        data() {
            return {
                nickName: '',
                newRoom: '',
                existedRoom: '',
                isWantOwnRoom: false,
                db: null,
                userId: null,
            }
        },

        methods: {
            loadNickName() {
                if (this.db.objectStoreNames.contains('userInfo')) {
                    const all = this.db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                    all.onsuccess = () => {
                        const result = all.result[0];
                        this.nickName = result?.nickName;
                        this.userId = result?.id;
                    };
                }
                
            },

            join() {
                const object = {
                    id: Math.round(Math.random() * 100000),
                    nickName: this.nickName,
                    picture: null,
                };


                const data = this.db.transaction('userInfo', 'readwrite').objectStore('userInfo');
                if (this.userId) {
                    data.delete(this.userId);
                }


                data.add(object);
                this.emitter.emit('isShouldUpdateInfo');
                this.$router.push({
                    name: 'conference',
                    params: {id: this.existedRoom}
                });
            },
        }
    }
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

        &__input {
            width: 90%;
        }

        &__description {
            font-size: 20px;
        }
    }
</style>
