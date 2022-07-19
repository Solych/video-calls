<template>
    <div class="conference">
        <div class="conference__video"
             v-for="id in sources"
             :id="`user-${id}`"></div>
        <div class="conference_buttons buttons">
            <q-btn @click="toggleVideo()"
                   round
                   size="xl"
                   :icon=" isCameraOn ? 'videocam' : 'videocam_off'"
                   class="buttons__voice"/>
            <q-btn @click="toggleMic()"
                   round
                   size="xl"
                   :icon="isMicOn ? 'mic' : 'mic_off'"
                   class="buttons__video"/>
            <q-btn color="red"
                   @click=leave()
                   icon="cancel"
                   round
                   size="xl"
                   class="buttons__leave"/>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent, ref, onBeforeMount } from 'vue';
    import router from '@/router';
    import { useRoute } from 'vue-router';
    export const APP_ID = '19305c253e92402482791774613de11d';
    let localTracks: any[] = [];
    let client: any = null;

    export default defineComponent({
        name: 'ConferenceView',

        setup() {
            const route = useRoute();
            let userId = ref(null);
            let roomNumber = ref('');
            let isMicOn = ref(true);
            let isCameraOn = ref(true);
            let sources = ref([]);
            let db = <IDBDatabase><unknown>ref();

            const loadDataFromDb = () => { // to create a service for not copy-pasting
                const openDB = indexedDB.open('webrtc', 1);
                openDB.onsuccess = () => {
                    db = openDB.result;
                    const all = db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                    all.onsuccess = () => {
                        const result = all.result[0];
                        userId.value = result.id;
                        sources.value.push(<never>result.id);
                        initStreams();
                    };
                };
            };

            const initStreams = async() => {
                client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                await client.join(APP_ID, roomNumber.value, null, userId.value);
                await initLocal();

                client.on('user-published', handleUserJoined);
                client.on('user-left', handleUserLeft);
            };

            const handleUserJoined = async(user: any, mediaType: any) => {
                await client.subscribe(user, mediaType);
                const player = document.getElementById(`user-${user.uid}`) ;

                if (!player) {
                    sources.value.push(<never>user.uid);
                }

                if (mediaType === 'video'){
                    user.videoTrack.play(`user-${user.uid}`);
                }

                if (mediaType === 'audio'){
                    user.audioTrack.play();
                }
            };

            const handleUserLeft = async (user: any) => sources.value = sources.value.filter(item => item !== user.uid);

            const initLocal = async () => {
                localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, { encoderConfig: {
                        width:{ min:640, ideal:1920, max:1920 },
                        height:{ min:480, ideal:1080, max:1080 }
                }});

                localTracks[1].play(`user-${userId.value}`);

                await client.publish([localTracks[0], localTracks[1]]);
            };

            const leave = async () => {
                for (let i = 0; i < localTracks.length; i++) {
                    localTracks[i].stop();
                    localTracks[i].close();
                }

                await client.unpublish([localTracks[0], localTracks[1]]);
                router.push('/');
            };

            const toggleMic = () => {
                localTracks[0]?.setMuted(isMicOn.value);
                isMicOn.value = !isMicOn.value;
            };

            const toggleVideo = () => {
                localTracks[1]?.setMuted(isCameraOn.value);
                isCameraOn.value = !isCameraOn.value;
            };

            const routeToSettings = () => router.push('/settings');

            onBeforeMount(() => {
                roomNumber.value = <string>route.params.id;
                loadDataFromDb();
            });

            return {
                isMicOn,
                isCameraOn,
                sources,

                leave,
                toggleMic,
                toggleVideo,
                routeToSettings,
            };
        },
    });
</script>

<style lang="scss" scoped>
    .conference {
        background-color: #edeef0;
        display: grid;
        gap: 20px;

        &__video {
            margin: 0 auto;

            &:deep(div) {
                border-radius: 50%;
            }
        }

        @media (min-width: 900px) {
            grid-template-columns: auto auto;
            &__video {
                height: 400px;
                width: 400px;
            }
        }

        @media (max-width: 900px) {
            grid-template-columns: auto auto;
            &__video {
                height: 300px;
                width: 300px;
            }
        }

        @media (max-width: 650px) {
            grid-template-columns: auto auto;
            &__video {
                height: 250px;
                width: 250px;
            }
        }

        @media (max-width: 540px) {
            grid-template-columns: auto;
            &__video {
                height: 400px;
                width: 400px;
            }
        }

        @media (max-width: 440px) {
            &__video {
                height: 350px;
                width: 350px;
            }
        }

        @media (max-width: 400px) {
            &__video {
                height: 300px;
                width: 300px;
            }
        }

        @media (max-width: 330px) {
            &__video {
                height: 250px;
                width: 250px;
            }
        }
    }

    .user {
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 20px;
        border: 1px solid gray;
        border-radius: 8px;
        padding: 8px;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        width: 300px;
        position: fixed;
        bottom: 30px;
        margin: auto;
        left: 0;
        right: 0;
    }

    .q-btn {
        background: #fff;
    }
</style>
