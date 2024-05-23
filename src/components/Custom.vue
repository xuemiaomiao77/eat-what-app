<script lang="ts" setup>
import { nextTick, ref, h } from 'vue'
import { ElInput, ElMessage, ElLoading } from 'element-plus'
import type { componentsName, menu } from '../type/index'

const emit = defineEmits<{
    changeName: [name: componentsName],
    update: [data: menu[]]
}>()
const inputValue = ref('')
const dynamicTags = ref<string[]>(["油泼面", "刀削面"])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const hideTag = ref<string>('')
const handleClose = (tag: string) => {
    dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}

const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value!.input!.focus()
    })
}

const handleInputConfirm = () => {
    if (inputValue.value) {
        dynamicTags.value.push(inputValue.value)
    }
    inputVisible.value = false
    inputValue.value = ''
}

const validate = () => {
    if (dynamicTags.value.length < 9) {
        ElMessage({
            message: h('p', { style: 'line-height: 1; font-size: 14px' }, [
                h('span', null, '就没啥想吃的嘛，至少得凑凑9个吧'),
            ]),
        })
        return false
    } else if (dynamicTags.value.length > 9) {
        ElMessage({
            message: h('p', { style: 'line-height: 1; font-size: 14px' }, [
                h('span', null, '太多啦太多啦，咱只能放9个'),
            ]),
        })
        return false
    }

    const menuSet = new Set<string>(dynamicTags.value)

    if(hideTag.value) {
        menuSet.add(hideTag.value)
        if(menuSet.size < 10){
            return false
        }
    }else{
        if(menuSet.size < 9){
            return false
        }
    }
    
    return true
}
const generateMenu = () => {
    const goon: boolean = validate() as boolean
    if(!goon){
        return
    }
    
    const loading = ElLoading.service({
        lock: true,
        text: '生成ing~',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    let menu: menu[] = []
    menu = dynamicTags.value.map(item => {
        return {
            name: item,
            opened: false
        }
    })
    localStorage.setItem('regulardata', JSON.stringify(menu))
    if (hideTag.value && Math.floor(Math.random()*100) > 95) {
        menu.push({ name: hideTag.value, opened: false, special: true })
    }
    if(hideTag.value){
        const hideData: menu[] = [{ name: hideTag.value as string, opened: false}]
        localStorage.setItem('hide', JSON.stringify(hideData))
    }
    localStorage.setItem('data', JSON.stringify(menu))

    loading.close()
    emit('changeName', 'Jiugongge')
    emit('update', menu)
}
</script>

<template>
    <el-card style="width: 80%; margin: 20px auto;">
        <template #header>
            <div class="card-header">
                <span>自定义菜单</span>
            </div>
        </template>

        <div class="flex gap-2">
            <el-tag v-for="tag in dynamicTags" :key="tag" closable :disable-transitions="false"
                @close="handleClose(tag)">
                {{ tag }}
            </el-tag>
            <el-input v-if="inputVisible" ref="InputRef" v-model="inputValue" class="w-20" size="small"
                @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 添加菜单
            </el-button>
        </div>
    </el-card>
    <el-card style="width: 80%; margin: 0px auto 20px;">
        <template #header>
            <div class="card-header">
                <span>隐藏款</span>
            </div>
        </template>

        <div class="flex gap-2">
            <el-input v-model="hideTag" size="small" />
        </div>
    </el-card>
    <el-button style="margin: 0 auto;display: block;" @click="generateMenu">生成菜单</el-button>
</template>

<style scoped lang="less"></style>