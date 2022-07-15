<template>
    <div class="settings-form-container">
        <span class="settings-form-container__header">Settings</span>
        <div class="container__settings-form settings-form">
            <div class="settings-form__name">
                <q-input outlined
                         v-model="nickName"
                         label="Type your name"/>
            </div>
            <div class="settings-form__image">
                <q-file outlined
                        clearable
                        @input="updateFile()"
                        @clear="removeImage()"
                        v-model="image"
                        accept=".jpg, .img"
                        label="Upload a picture (img, jpg)">
                    <template v-slot:prepend>
                        <q-icon name="cloud_upload"/>
                    </template>
                </q-file>
            </div>
            <div class="settings-from__approve">
                <q-btn color="primary"
                       @click="save()"
                       icon-right="check"
                       label="Save"/>
            </div>
        </div>
        <div class="settings-form-container__preview preview">
            <span v-if="imageUrl || nickName"
                  class="preview__description">Preview</span>
            <Avatar :avatar="imageUrl"
                    :nickName="nickName"/>
        </div>

    </div>
</template>

<script>
    import {useQuasar} from 'quasar'
    import Avatar from '../components/Avatar.vue';


    export default {
        name: "SettingsView.vue",
        components: {
            Avatar,
        },
        data() {
            return {
                nickName: '',
                db: null,
                userId: null,
                imageUrl: null,
                image: null,
                $q: useQuasar(),
            }
        },

        created() {
            const openDB = indexedDB.open('webrtc', 1);
            openDB.onsuccess = () => {
                this.db = openDB.result;
                const all = this.db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                all.onsuccess = () => {
                    const result = all.result[0];
                    this.nickName = result.nickName;
                    this.userId = result.id;
                    this.imageUrl = result.picture;
                };
            }
        },

        methods: {
            removeImage() {
                this.image = null;
                this.imageUrl = null;
            },

            save() {
                const userData = {
                    id: this.userId,
                    picture: this.imageUrl,
                    nickName: this.nickName,
                };
                const data = this.db.transaction('userInfo', 'readwrite').objectStore('userInfo');
                const deletion = data.delete(this.userId);
                const adding = data.add(userData);

                deletion.onerror = () => console.log(deletion);


                adding.onerror = () => {
                    this.$q.notify({
                        message: 'Something goes wrong...',
                        color: 'red'
                    });
                };

                adding.onsuccess = () => {
                    this.$q.notify({
                        message: 'Saved!',
                        color: 'green'
                    });

                    this.emitter.emit('isShouldUpdateInfo');
                }

            },


            updateFile() {
                const interval = setInterval(() => {
                    if (this.image) {
                        this.imageUrl = URL.createObjectURL(this.image);
                        this.generateBase64String();
                        clearInterval(interval);
                    }

                }, 200);
            },

            generateBase64String() {
                const reader = new FileReader();
                reader.readAsDataURL(this.image);
                reader.onload = () => {
                    this.imageUrl = reader.result;
                };
            }
        }
    }
</script>

<style lang="scss" scoped>
    .settings-form-container {
        display: flex;
        flex-direction: column;
        align-items: center;

        &__header,
        &__preview {
            font-size: 24px;
            margin-top: 24px;
        }
    }

    .settings-form {
        margin-top: 24px;
        width: 80%;
        height: 200px;
        display: flex;
        flex-direction: column;
        border: 2px solid gray;
        border-radius: 4px;
        padding: 8px;
        justify-content: space-between;
        max-width: 400px;
    }
</style>
