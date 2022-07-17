<template>
    <div class="conference">
        <div class="conference__buttons buttons">
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

<script>
    export const APP_ID = '19305c253e92402482791774613de11d';
    let localTracks = [];
    let client;

    export default {
        name: 'ConferenceView',
        data() {
            return {
                isMicOn: true,
                isCameraOn: true,
                userId: '',
                roomNumber: '',
            }
        },
        methods: {

            async initStreams() {
                client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                await client.join(APP_ID, this.roomNumber, null, this.userId);
                await this.initLocal();

                client.on('user-published', this.handleUserJoined);
                client.on('user-left', this.handleUserLeft);
            },

            async handleUserJoined(user, mediaType) {
                await client.subscribe(user, mediaType);
                const player = document.getElementById(`user-${user.uid}`) ;

                if (!player) {
                    this.insertIntoContainer(user.uid)
                }

                if (mediaType === 'video'){
                    user.videoTrack.play(`user-${user.uid}`);
                }

                if (mediaType === 'audio'){
                    user.audioTrack.play();
                }
            },

            async handleUserLeft(user) {
                let item = document.getElementById(user.uid);
                if(item){
                    item.remove();
                }
            },

            async initLocal() {
                localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, { encoderConfig: {
                    width:{ min:640, ideal:1920, max:1920 },
                    height:{ min:480, ideal:1080, max:1080 }
                }});
                this.insertIntoContainer(this.userId);
                localTracks[1].play(`user-${this.userId}`);
                
                await client.publish([localTracks[0], localTracks[1]]);
            },

            toggleMic() {
                localTracks[0].setMuted(this.isMicOn ? true : false);
                this.isMicOn = !this.isMicOn;
            },

            toggleVideo() {
                localTracks[1].setMuted(this.isCameraOn ? true : false);
                this.isCameraOn = !this.isCameraOn;
            },

            async leave() {
                for (let i = 0; i < localTracks.length; i++){
                    localTracks[i].stop()
                    localTracks[i].close()
                }

                await client.unpublish([localTracks[0], localTracks[1]]);
                this.$router.push('/');
            },

            routeToSettings() {
                this.$router.push('/settings');
            },

            loadDataFromDb() {
                const openDB = indexedDB.open('webrtc', 1);
                openDB.onsuccess = () => {
                    this.db = openDB.result;
                    const all = this.db.transaction('userInfo', 'readonly').objectStore('userInfo').getAll();
                    all.onsuccess = () => {
                        const result = all.result[0];
                        this.userId = result.id;
                        this.initStreams();
                    };
                };
            },

            insertIntoContainer(id) {
                const player = `<div class="conference__video" id=user-${id}></div>`;
                const container = document.getElementsByClassName('conference')[0];
                container.insertAdjacentHTML('beforeend', player);
            },
        },
        created() {
            this.roomNumber = this.$route.params.id;
            this.loadDataFromDb();
        },

        
    }
</script>

<style lang="scss">
    .conference {
        background-color: #edeef0;
        display: grid;
        gap: 20px;

        &__video {
            margin: 0 auto;

            div {
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
