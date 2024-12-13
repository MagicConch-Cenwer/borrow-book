<template>
  <div class="wrapper">
    <el-row style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-input v-model="session" style="width: 240px" placeholder="请输入cookie" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-select v-model="data.grade" placeholder="请选择年级" style="width: 240px" @change="onChange">
          <el-option v-for="item in grade" :key="item.name" :label="item.name" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-select v-model="data.class" placeholder="请选择班级" style="width: 240px">
          <el-option v-for="item in data.classes" :key="item.name" :label="item.name" :value="item.value" />
        </el-select>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px;">
      <el-col :span="4">
        <el-button type="primary" @click="borrow">借书</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="also">还书</el-button>
      </el-col>

      <el-col :span="4">
        <el-button type="primary" @click="test">测试</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import axios from 'axios'
import { reactive, ref, watch } from 'vue'

const session = ref('')

const data = reactive({
  grade: '',
  class: '',
  classes: []
})

watch(() => session.value, () => {
  document.cookie = `SESSION = ${session.value}`
})

const onChange = () => {
  data.classes = grade.find(item => item.name === data.grade).class || []
}

// const url = 'https://lib.scjyzb.net/'
const url = '/api'

const test = () => {
  axios.post(url + '/v1/circulation/getBorrowReader', {
    code: '20180101'
  }).then(res => {
    console.log(res)
  })
}


// 借书
const borrow = async () => {
  if (!data.grade || !data.class) {
    alert('请选择年级和班级！！！！！！')
    return
  }
  const studentNum = getNum()
  for (let i = 0; i < studentNum.length; i++) {
    // 获取学生信息
    const studentInfo = await getStudentInfo(studentNum[i])
    // 读者id
    const readerId = studentInfo.data.rows[0].readerInfo.readerId
    // 读者code
    const readerCode = studentInfo.data.rows[0].readerInfo.readerCode
    // 已借数量
    const haveBorrowNum = studentInfo.data.rows[0].readerInfo.haveBorrowNum
    for (let j = 0; j < 6 - haveBorrowNum; j ++) {
      const data = await borrowBook(readerId, readerCode)
      console.log(data)
    }
  }
  alert('借书完成')
}

// 还书
const also = async () => {
  if (!data.grade || !data.class) {
    alert('请选择年级和班级！！！！！！')
    return
  }
  const studentNum = getNum()
  for (let i = 0; i < studentNum.length; i++) {
    // 获取学生信息
    const studentInfo = await getStudentInfo(studentNum[i])
    // 读者id
    const readerId = studentInfo.data.rows[0].readerInfo.readerId
    // 获取学生已借书列表
    const studentBook = await getStudentBook(readerId)
    for (let j = 0; j < studentBook.data.rows.length; j++) {
      const data = await alsoBook(studentBook.data.rows[j].barcode)
      console.log(data)
    }
  }
  alert('还书完成')
}

// 还书
const alsoBook = async (barcode) => {
  const data = await axios.post(url + '/v1/circulation/returnBook', {
    barcode
  })
  return new  Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 1400)
  })
}

// 生成学生信息
const getNum = () => {
  const no = []
  if (data.class === 'all') {
    data.classes.forEach(ele => {
      for(let i = 1; i<= ele.data; i++) {
        no.push(`${data.grade}${ele.value}${i <= 9 ? '0' + i : i}`)
      }
    });
  } else {
    const num = data.classes.find(item => item.value === data.class).data || 0
    if (num) {
      for(let i = 1; i<= num; i++) {
        no.push(`${data.grade}${data.class}${i <= 9 ? '0' + i : i}`)
      }
    }
  }
  return no
}

// 获取学生信息
const getStudentInfo =  (code) => {
  return axios.post(url + '/v1/circulation/getBorrowReader', {
    code
  })
}

// 获取学生已借书列表
const getStudentBook =  (readerId) => {
  return axios.post(url + '/v1/circulation/getReaderDebitBookInfo?page=1&pagesize=20', {
    readerId
  })
}

// 获取图书信息
const getBookInfo =  (barcode) => {
  return axios.post(url + '/v1/catalog/bookBar/bookBarListQuery?page=1&pagesize=20', {
    barcode
  })
}

// 借书
const borrowBookInfo = (barcode, readerId, code) => {
  return axios.post(url + '/v1/circulation/borrowBook', {
    barcode, // 书本编码
    readerId, // 读者readerId
    code // 读者code
  })
}
const borrowBook =  async (readerId, code) => {
  // const studentBook = await getStudentBook(readerId)
  let flag = true;
  let bookId = ''
  while (flag) {
    // 随机获取一本书，要求状态是
    let random = Math.ceil(Math.random() * 29555) + ''
    for (let j = random.length; j < 8; j++) {
      random = '0' + random
    }
    const bookInfo = await getBookInfo(random)
    // 判断有这本书，而且状态是在库
    if (bookInfo.data.rows[0] && bookInfo.data.rows[0].state === '0') {
      bookId = random
      flag = false
      // 判断学生已借的书中，没有此书
      // const includeBook = studentBook.data.rows.find(item => item.title === bookInfo.data.rows[0].title)
      // if (!includeBook) {
      //   bookId = random
      //   flag = false
      // }
    }
  }

  const borrowBooks = await borrowBookInfo(bookId, readerId, code)

  return new  Promise((resolve) => {
    setTimeout(() => {
      resolve(borrowBooks)
    }, 2000)
  })
}

const grade = [
  {
    name: '2018', value: '2018', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 41},
      {name: '02', value: '02', data: 44},
      {name: '03', value: '03', data: 41},
      {name: '04', value: '04', data: 45},
      {name: '05', value: '05', data: 43},
      {name: '06', value: '06', data: 43},
    ]
  },
  {
    name: '2019', value: '2019', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 50},
      {name: '02', value: '02', data: 48},
      {name: '03', value: '03', data: 49},
      {name: '04', value: '04', data: 49},
      {name: '05', value: '05', data: 49},
    ]
  },
  {
    name: '2020', value: '2020', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 46},
      {name: '02', value: '02', data: 48},
      {name: '03', value: '03', data: 49},
      {name: '04', value: '04', data: 46},
      {name: '05', value: '05', data: 46},
    ]
  },
  {
    name: '2021', value: '2021', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 50},
      {name: '02', value: '02', data: 49},
      {name: '03', value: '03', data: 50},
      {name: '04', value: '04', data: 50},
      {name: '05', value: '05', data: 50},
      {name: '06', value: '06', data: 50},
    ]
  },
  {
    name: '2022', value: '2022', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 46},
      {name: '02', value: '02', data: 46},
      {name: '03', value: '03', data: 47},
      {name: '04', value: '04', data: 50},
      {name: '05', value: '05', data: 48},
      {name: '06', value: '06', data: 48},
    ]
  },
  {
    name: '2023', value: '2023', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 49},
      {name: '02', value: '02', data: 50},
      {name: '03', value: '03', data: 49},
      {name: '04', value: '04', data: 48},
      {name: '05', value: '05', data: 48},
      {name: '06', value: '06', data: 47},
      {name: '07', value: '07', data: 49},
    ]
  },
  {
    name: '2024', value: '2024', class: [
      {name: 'all', value: 'all', data: 'all'},
      {name: '01', value: '01', data: 46},
      {name: '02', value: '02', data: 46},
      {name: '03', value: '03', data: 46},
      {name: '04', value: '04', data: 46},
      {name: '05', value: '05', data: 45},
      {name: '06', value: '06', data: 44},
    ]
  },
]
</script>

<style scoped>
.wrapper {
  padding: 100px;
}
</style>
