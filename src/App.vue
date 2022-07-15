<template>
    <div class="main-container">
        <Header/>
        <router-view></router-view>
    </div>


</template>


<script>
    import {defineComponent} from 'vue';
    import Header from '@/components/Header.vue';

    export default defineComponent({
        name: 'LayoutDefault',

        components: {
            Header,
        },
    });
</script>

<style lang="scss" scoped>
    .main-container {
        background-color: #edeef0;
        height: 100vh;
    }
</style>
