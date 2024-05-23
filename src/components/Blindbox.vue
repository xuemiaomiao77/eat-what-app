<script setup lang="ts">
import { ref, onMounted, watch, watchEffect } from 'vue'
import type { componentsName, menu } from '../type/index'
import 'animate.css';
import { delay, throttle } from '../until/tool'
import OpenSpecialEffects from './OpenSpecialEffects.vue'

const props = defineProps<{
    localData: menu[]
}>()

const emit = defineEmits<{
    changeName: [name: componentsName],
    update: [data: menu[]]
}>()

const menuData = ref<menu[]>([])
const regularMenuData = ref<menu[]>([])
const tipsmenuData = ref<menu[]>([])
const blindboxIndex = ref<number>(0)
const classStr = ref<string>('icon animate__animated')

watchEffect(() => {
    const data: menu[] = props.localData
    if (!data) {
        emit('changeName', 'Custom')
    }
    let menuData_: menu[] = data.filter(item => !item.special)
    let index = menuData_.findIndex(item => !item.opened)

    menuData.value = menuData_
    blindboxIndex.value = index > -1 ? index : 0
})

onMounted(() => {
    let dataAll: menu[] = []
    if(localStorage.getItem('regulardata')){
        dataAll = JSON.parse(localStorage.getItem('regulardata') as string)
    }
    if(localStorage.getItem('hide')){
        let data: menu[] = JSON.parse(localStorage.getItem('hide') as string)
        regularMenuData.value = data
        dataAll.concat(...data)
    }
    tipsmenuData.value = dataAll
})

const changeIndex = throttle((i: number) => {
    if(menuData.value[i].opened) return
    classStr.value = 'icon animate__animated animate__faster';
    blindboxIndex.value = i
    direction.value = null
}, 2000)

enum Direction {
    left,
    right
}
const direction = ref<Direction | null>(null)
const dirChange = throttle(async (val: Direction) => {
    classStr.value = 'icon animate__animated animate__faster';
    if (Direction.left === val) {
        let menuData_ = menuData.value.slice(0, blindboxIndex.value)
        let index = menuData_.reverse().findIndex((item: menu) => !item.opened)
        if(index > -1){
            blindboxIndex.value = menuData_.length - index - 1
        }
    } else if (Direction.right === val) {
        let menuData_ = menuData.value.slice(blindboxIndex.value + 1)
        let index = menuData_.findIndex((item: menu) => !item.opened)
        if(index > -1){
            blindboxIndex.value = index + blindboxIndex.value + 1
        }
    }
    direction.value = val


}, 2000)


watch(() => blindboxIndex.value, (val: number) => {
    if(direction.value == 0){
        classStr.value = 'icon animate__animated animate__backOutLeft'
        setTimeout(() => {
            classStr.value = 'icon animate__animated animate__bounceInDown'
        }, 500)
    }else if(direction.value == 1){
        classStr.value = 'icon animate__animated animate__backOutRight'
        setTimeout(() => {
            classStr.value = 'icon animate__animated animate__bounceInDown'
        }, 500)
    }else{
        classStr.value = 'icon animate__animated animate__bounceInDown animate__faster'
    }


})

const styleIcon = ref<string>('')

watch(() => classStr.value, (val: string) => {
    setTimeout(() => {
        classStr.value = 'icon animate__animated animate__faster';
        styleIcon.value = ''
    }, 2000);
})

enum blindType {
    open,
    hint
}

const hintMsg = ref<string>('')
const blindMsg = ref<string>('')
const hintClassStr = ref<string>('hint-msg')
const openBlindbox = throttle(async (type: blindType) => {
    classStr.value = 'icon animate__animated animate__shakeX animate__shakeY animate__faster'
    styleIcon.value = 'animation-duration: .6s;'
    // 80%概率是普通  20%概率是隐藏
    let allBlind = menuData.value.filter(item => !item.opened)
    if(!allBlind.length) {
        alert('牌子都翻完了')
        return 
    }
    if(blindType.open === type){
        blindMsg.value = menuData.value[blindboxIndex.value].name
    }else if(blindType.hint === type){
        await delay(500)
        const index: number = allBlind.findIndex(item => item.name === menuData.value[blindboxIndex.value].name)
        allBlind.splice(index, 1)
        const chooseIndex = Math.floor(Math.random()*allBlind.length)
        hintMsg.value = allBlind[chooseIndex].name
        hintClassStr.value = 'hint-msg animate__animated animate__fadeIn'
        tipsHandler()
        await delay(2000)
        hintMsg.value = ''
        hintClassStr.value = 'hint-msg'
    }
}, 1000)

const tipsHandler = () => {
    const index = tipsmenuData.value.findIndex(item => item.name === hintMsg.value)
    const excludeArr = tipsmenuData.value.splice(index, 1)
    excludeArr.map(item => item.exclude = true)
    tipsmenuData.value.splice(0, 0, ...excludeArr)
}

watch(() => blindMsg.value, (val) => {
    if(val){
        if(regularMenuData.value[0] && val === regularMenuData.value[0].name){
            regularMenuData.value[0].opened = true
        }
        menuData.value.forEach(item => {
            if(item.name === val){
                item.opened = true
            }
        })
        emit('update', menuData.value)
    }
})

const cancelModal = () => {
    blindMsg.value = ''
}

</script>

<template>
    <OpenSpecialEffects v-if="blindMsg" :name="blindMsg" @cancel="cancelModal" />
    <div class="main">
        <div class="big-box-preview">
            <p class="preview-title">大盒预览</p>
            <div class="small-box">
                <span v-for="item, index in menuData" @click="changeIndex(index)"
                    :class="[blindboxIndex === index ? 'active small-box-item' : item.opened ? 'disabled small-box-item' : 'small-box-item']">{{
                    index + 1 }}</span>
            </div>
        </div>
        <div class="blindbox">
            <i-ep-arrow-left class="arrow left-arrow" @click="dirChange(0)" />
            <i-ep-arrow-right class="arrow right-arrow" @click="dirChange(1)" />
            <div :class="hintClassStr" v-if="hintMsg">
                盒子里不是{{ hintMsg }}
            </div>
            <svg t="1716106589997" :class="classStr" :style="styleIcon" viewBox="0 0 1201 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="2824">
                <path
                    d="M1109.267692 698.722462c-9.216-272.285538-232.704-490.200615-507.214769-490.200616-274.530462 0-498.018462 217.915077-507.254154 490.200616h1014.488616z"
                    fill="#0CB04A" p-id="2825"></path>
                <path
                    d="M255.094154 503.532308a19.849846 19.849846 0 0 1-17.979077-28.416c58.486154-123.470769 184.497231-203.224615 321.024-203.224616a19.889231 19.889231 0 0 1 0 39.778462c-121.225846 0-233.137231 70.833231-285.065846 180.48a19.889231 19.889231 0 0 1-17.979077 11.362461z"
                    fill="#EDEDED" p-id="2826"></path>
                <path
                    d="M660.578462 211.987692a510.168615 510.168615 0 0 1 158.700307 145.762462c81.624615 115.554462-0.118154 275.121231-141.607384 275.121231H101.474462c-3.564308 21.543385-5.907692 43.480615-6.675693 65.851077h1014.488616c-8.566154-252.632615-201.629538-458.338462-448.708923-486.73477z"
                    fill="#000000" opacity=".35" p-id="2827"></path>
                <path d="M1198.611692 1023.488H5.454769v-351.310769h1193.156923v351.310769z" fill="#FF3A2F" p-id="2828">
                </path>
                <path
                    d="M1044.972308 672.177231v41.531077c0 134.734769-109.233231 243.948308-243.968 243.948307H5.474462v65.851077h1193.156923v-351.310769h-153.659077z"
                    fill="#000000" opacity=".35" p-id="2829"></path>
                <path
                    d="M708.135385 106.082462a106.082462 106.082462 0 1 1-212.184616 0 106.082462 106.082462 0 0 1 212.164923 0z"
                    fill="#142A3B" p-id="2830"></path>
                <path d="M585.038769 84.125538a26.899692 26.899692 0 1 1-53.779692 0 26.899692 26.899692 0 0 1 53.76 0z"
                    fill="#EDEDED" p-id="2831"></path>
                <path
                    d="M625.486769 2.796308c23.473231 19.456 38.734769 48.462769 38.734769 81.32923a106.082462 106.082462 0 0 1-106.082461 106.082462c-8.073846 0-15.872-1.083077-23.433846-2.796308 18.353231 15.222154 41.629538 24.733538 67.347692 24.733539A105.984 105.984 0 1 0 625.486769 2.796308z"
                    fill="#000000" opacity=".35" p-id="2832"></path>
            </svg>
        </div>
        <p>No: {{ blindboxIndex + 1 }}</p>
        <div class="blindbox-all">
            <span class="scroll-title">9款普通+1款隐藏</span>
            <el-scrollbar>
                <div class="scrollbar-flex-content">
                    <p v-for="item in tipsmenuData" :class="[item.exclude? 'scrollbar-item-exclude scrollbar-item': 'scrollbar-item']">
                        <span v-if="item.exclude">不是我</span>
                        {{ item.name }}
                    </p>
                </div>
            </el-scrollbar>
        </div>
        <div class="btn-group">
            <div class="open-btn" @click="openBlindbox(0)">
                <span>就选它</span>
                <span>在线拆盒，款式立即揭晓</span>
            </div>
            <div class="open-btn hint-btn" @click="openBlindbox(1)">
                <svg t="1716262226150" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="36218" width="30" height="30"><path d="M233.161697 43.442424c-44.683636 0-80.86497-4.033939-80.86497 19.828364v909.901576c0 22.962424 43.969939 38.384485 83.440485 29.292606l239.429818-55.171879a155.523879 155.523879 0 0 1 67.956364 0l239.429818 55.171879c39.470545 9.091879 83.471515-6.361212 83.471515-29.292606V63.301818c0-23.862303-36.150303-19.859394-80.833939-19.859394H233.161697z" fill="#f30101" opacity=".397" p-id="36219"></path><path d="M500.456727 356.972606a28.237576 28.237576 0 0 1-37.050182 0L380.028121 281.382788a22.248727 22.248727 0 0 1 0-33.605818 28.237576 28.237576 0 0 1 37.019152 0l64.853333 58.802424 125.052121-113.477818a28.237576 28.237576 0 0 1 37.019152 0c10.24 9.216 10.24 24.389818 0 33.605818l-143.515152 130.265212z" fill="#f30101" opacity=".397" p-id="36220"></path><path d="M250.042182 835.025455c17.687273 0 26.686061-8.998788 26.68606-26.375758v-91.539394c8.998788-4.344242 17.997576-8.688485 26.686061-13.34303v-22.652121c-8.688485 4.964848-17.687273 9.309091-26.686061 13.653333v-60.509091h31.340606v-21.410909h-31.340606v-58.647273h-22.962424v58.647273h-37.546666v21.410909h37.546666v70.128485c-13.653333 5.275152-27.306667 9.619394-41.270303 13.032727l5.275152 22.341818c12.101818-3.723636 24.203636-8.067879 35.995151-12.722424v75.713939c0 7.757576-4.033939 11.791515-11.481212 11.791516-8.067879 0-16.135758-0.620606-24.824242-1.241213l4.654545 21.721213h27.927273z m82.230303-270.894546v107.675152h135.292121v-107.675152h-135.292121z m113.570909 89.367273h-91.849697v-26.686061h91.849697v26.686061z m-91.849697-44.06303v-26.996364h91.849697v26.996364h-91.849697z m-43.442424 84.092121v19.859394h78.506666v90.608485a96.504242 96.504242 0 0 1-7.447272-2.792728c-13.032727-5.895758-24.513939-19.238788-34.443637-40.029091 2.482424-10.550303 4.033939-21.100606 4.654546-32.271515l-19.859394-2.172121c-2.482424 35.374545-15.515152 67.646061-39.098182 96.193939l16.446061 14.27394c13.34303-16.135758 23.58303-33.82303 31.030303-53.061818 9.309091 17.37697 20.169697 29.168485 31.961212 35.374545 14.894545 7.447273 42.821818 11.481212 83.781818 11.791515 9.929697 0 21.410909 0.310303 33.82303 0.310303l6.206061-21.721212c-11.481212 0.930909-25.444848 1.551515-41.580606 1.551515-17.066667 0-31.650909-0.930909-44.063031-2.792727v-40.029091h64.853334v-20.169697h-64.853334v-35.064242h77.575758v-19.859394h-177.493333zM551.346424 768h75.093334v31.650909h-75.093334v-31.650909z m75.093334 50.889697v17.066667h17.997575v-212.867879h-29.789091v-37.236364h35.995152v-19.859394h-126.913939v19.859394h39.718787v37.236364h-30.099394v212.867879h17.997576v-17.066667h75.093334z m-29.168485-195.801212h-16.446061v-37.236364h16.446061v37.236364z m29.168485 126.603636h-75.093334v-22.962424l9.309091 8.067879c13.653333-15.204848 20.790303-39.408485 21.100606-72.300606v-20.790303h15.204849v62.991515c0 10.550303 4.654545 16.135758 14.273939 16.135757h15.204849v28.858182z m-16.446061-107.985454h16.446061v64.853333h-11.791516c-3.10303 0-4.654545-1.861818-4.654545-4.964848v-59.888485z m-58.647273 83.471515v-83.471515h17.687273v20.790303c-0.310303 28.237576-6.206061 49.027879-17.687273 62.681212z m115.743031-160.426667v104.572121h125.052121V564.751515h-125.052121z m103.951515 86.574546h-83.161212v-25.134546h83.161212v25.134546z m-83.161212-43.132122v-25.444848h83.161212v25.444848h-83.161212z m-4.03394 115.122425h38.787879v32.581818h-47.476364v19.549091h47.476364v33.82303h-64.853333v21.100606h147.393939v-21.100606h-61.129697v-33.82303h46.545455v-19.549091h-46.545455v-32.581818h53.372121v-19.549091h-53.372121v-24.824243h-21.410909v24.824243h-31.650909c2.172121-7.13697 4.033939-14.894545 5.585454-22.962425l-19.54909-2.172121c-4.964848 26.065455-14.584242 47.786667-28.858182 65.47394l12.722424 16.756363c8.998788-11.170909 16.756364-23.893333 22.962424-37.546666z" fill="#f30101" p-id="36221"></path></svg>
                <span>提示卡</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    background-color: #efefef;

    .big-box-preview {
        position: absolute;
        z-index: 9;
        top: 5%;
        left: 5%;
        background: #fff;
        padding: 10px;
        border-radius: 8px;

        .preview-title {
            font-size: 12px;
            line-height: 20px;
            margin: 0;
        }

        .small-box {
            display: flex;
            flex-wrap: wrap;
            width: 70px;
            height: 70px;
            justify-content: space-between;
            align-content: space-between;
            margin-top: 10px;

            .small-box-item {
                display: inline-block;
                width: 20px;
                height: 20px;
                font-size: 12px;
                line-height: 20px;
                text-align: center;
                background-color: #ccc;
                color: #fff;
                border-radius: 50%;
                cursor: pointer;

                &.disabled {
                    background-color: #efefef
                }

                &.active {
                    background-color: #f30101
                }
            }
        }
    }

    .blindbox {
        position: relative;
        width: 100%;
        height: auto;

        .icon {
            animation-duration: 1s;
            width: 50%;
            margin: 0 auto;
            display: block;
        }

        .arrow {
            position: absolute;
            top: 50%;
            color: #fff;
            background: #ccc;
            border-radius: 50%;
            border: 5px solid #ccc;

            &.left-arrow {
                left: 5%;
            }

            &.right-arrow {
                right: 5%
            }
        }
        .hint-msg{
            position: absolute;
            top: -80px;
            left: 33%;
            padding: 20px 30px;
            box-shadow: 1px 0 10px #ccc;
            background-color: #fff;
            border-radius: 50px;
            &::after{
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                border-top: 10px solid #fff;
                border-right: 10px solid #fff;
                position: absolute;
                bottom: -5px;
                left: calc(50% - 10px);
                transform: rotate(45deg);

            }
        }
    }
    .blindbox-all{
        width: 90%;
        margin: 0 auto;
        margin-top: 50px;
        border: 1px solid #ccc;
        border-radius: 5px;
        .scroll-title{
            display: block;
            line-height: 30px;
            font-size: 12px;
            text-align: center;
            color: #333;
        }
        .scrollbar-flex-content {
            display: flex;
            transition: all 1 ease-in-out;
        }
        .scrollbar-item {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 100px;
            margin: 10px;
            text-align: center;
            border-radius: 4px;
            background: #fff;
            color: #666;
            position: relative;
            &.scrollbar-spec-item{
                background-color: #f30101;
                color: #fff;
            }
            &.scrollbar-item-exclude{
                background-color: #e9e9e9;
            }
            span{
                position: absolute;
                top: 0;
                left: 0;
                font-size: 12px;
            }
        }

    }
    .btn-group{
        margin-top: 100px;
        position: absolute;
        bottom: 50px;
        display: flex;
        gap: 20px;

        .open-btn{
            background-color: #f30101;
            color: #fff;
            border-radius: 50px;
            padding: 5px 30px;
            span:nth-child(1){
                line-height: 20px;
                font-size: 16px;
                display: block;
                text-align: center;
            }
            span:nth-child(2){
                line-height: 20px;
                font-size: 12px;
                display: block;
                text-align: center;
            }
        }
        .hint-btn{
            background: #fff;
            color: #333;
            display: grid;
            place-items: center;
            grid-template-columns: auto auto;
            gap: 10px;
            padding: 5px 20px;
            span:nth-child(2){ display: inline-block; font-size: 16px; }
        }
    }
}
</style>
