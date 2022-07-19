<template>
    <div class="settings-form-container">
        <span class="settings-form-container__header">Settings</span>
        <div class="container__settings-form settings-form">
            <div class="settings-form__name">
                <q-input outlined
                         v-model="username"
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
            <div class="settings-form__approve">
                <q-btn color="primary"
                       @click="save()"
                       icon-right="check"
                       label="Save"/>
            </div>
        </div>
        <div class="settings-form-container__preview preview">
            <span v-if="imageUrl || username"
                  class="preview__description">Preview</span>
            <Avatar :avatar="imageUrl"
                    :username="username"/>
        </div>

    </div>
</template>

<script lang="ts">
    import { useQuasar } from 'quasar'
    import Avatar from '../components/Avatar.vue';
    import { defineComponent, ref, onBeforeMount } from 'vue';
    import emitter from '@/service/emitter';


    export default defineComponent({
        name: 'SettingsView.vue',
        components: {
            Avatar,
        },

        setup() {

            let username = ref('');
            let image = ref(null);
            let imageUrl = ref('');
            let userId = ref(null);
            let db = <IDBDatabase><unknown>ref(null);
            const $q = useQuasar();

            const removeImage = () => {
                image.value = null;
                imageUrl.value = '';
            };

            const save = () => {
                const userData = {
                    id: userId.value,
                    picture: imageUrl.value,
                    username: username.value,
                };
                const data = db.transaction('userInfo', 'readwrite').objectStore('userInfo');
                const deletion = data.delete(<IDBValidKey><unknown>userId.value);
                const adding = data.add(userData);

                deletion.onerror = () => console.log(deletion);

                adding.onerror = () => {
                    $q.notify({
                        message: 'Something goes wrong...',
                        color: 'red'
                    });
                };

                adding.onsuccess = () => {
                    $q.notify({
                        message: 'Saved!',
                        color: 'green'
                    });

                    emitter.emit('isShouldUpdateInfo');
                }

            };

            const updateFile = () => {
                const interval = setInterval(() => {
                    if (image) {
                        imageUrl.value = URL.createObjectURL(<Blob><unknown>image.value);
                        generateBase64String();
                        clearInterval(interval);
                    }

                }, 200);
            };

            const generateBase64String = () => {
                const reader = new FileReader();
                reader.readAsDataURL(<Blob><unknown>image.value);
                reader.onload = () => {
                    imageUrl.value = <string>reader.result;
                };
            };

            onBeforeMount(() => {
                const openDB = indexedDB.open('webrtc', 1);
                openDB.onsuccess = () => {
                    db = openDB.result;
                    const all = db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                    all.onsuccess = () => {
                        const result = all.result[0];
                        username.value = result.username;
                        userId.value = result.id;
                        imageUrl.value = result.picture;
                    };
                }
            });

            return {
                username,
                imageUrl,
                image,

                removeImage,
                save,
                updateFile,
            };
        },
    });
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
