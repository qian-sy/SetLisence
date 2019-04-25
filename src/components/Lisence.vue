<template>
  <section>
    <h3>许可协议</h3>
    <div class="formContent">
      <h1 class="logoFont">WIIST<span style="color: #84c225">ONE</span></h1>
      <el-form label-width="100px" :model="form" style="margin-right: 20px;" size="medium" :rules="rules"
               ref="ruleForm">
        <el-form-item label="过期时间"
                      prop="expiryTime">
          <el-date-picker v-model="form.expiryTime"
                          format="yyyy-MM-dd HH:mm:ss"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          type="datetime"
                          placeholder="请选择过期时间"
                          style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-row v-for="(address, index) in form.ipAddress"
                :key="address.key">
          <el-col :span="10">
            <el-form-item :prop="'ipAddress.' + index + '.value'"
                          :rules="rules.ipRules"
                          :label="`IP地址${index+1}`">
              <el-input v-model="form.ipAddress[index].value"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :prop="'macAddress.' + index + '.value'"
                          :rules="rules.macRules"
                          :label="`Mac地址${index+1}`">
              <el-input v-model="form.macAddress[index].value"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button type="text"
                      style="color: red"
                      @click.prevent="removeBtn(index)"
                      v-show="form.macAddress.length !== 1">X</el-button>
          </el-col>
          <el-col :span="3" style="float: right">
            <el-button type="primary" icon="el-icon-plus"
                      @click.prevent="addBtn()"
                      v-show="index + 1 === form.macAddress.length"
                      style="float: right"
                      size="medium"></el-button>
          </el-col>
        </el-row>
        <el-form-item label="CPU序列号"
                      prop="cpuSerial">
          <el-input v-model="form.cpuSerial"></el-input>
        </el-form-item>
        <el-form-item label="主板序列号"
                      prop="mainBoardSerial">
          <el-input v-model="form.mainBoardSerial"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="16">
            <el-button style="float: right"
                       v-show="url"
                       @click="downLoad"
                       size="medium">下载</el-button>
          </el-col>
          <el-col :span="url ? 4 : 20">
            <el-button style="float: right"
                       @click="reset"
                       size="medium">重置</el-button>
          </el-col>
          <el-col :span="4">
            <el-button style="float: right"
                   type="primary"
                   :loading="btnLoading"
                   @click="confirm"
                   size="medium">确认</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </section>
</template>
<script>
import { createLisence, FetchDownLoadUrl } from '@/api/lisence'
import dayjs from 'dayjs'
export default {
  name: 'Lisence',
  data () {
    const expiryTimeValidate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入过期时间'))
      } else if (dayjs(value) < dayjs()) {
        callback(new Error('过期时间不能早于当前时间'))
      } else {
        callback()
      }
    }
    const ipValidate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入IP地址'))
      } else if ((this.times(this.ipList))[value] > 1) {
        callback(new Error('IP地址已存在'))
      } else {
        callback()
      }
    }
    const macValidate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入MAC地址'))
      } else if ((this.times(this.macList))[value] > 1) {
        callback(new Error('MAC地址已存在'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        expiryTime: [
          {
            validator: expiryTimeValidate,
            trigger: 'blur'
          }
        ],
        mainBoardSerial: [{
          required: true,
          message: '请输入主板序列号',
          trigger: 'blur'
        }],
        cpuSerial: [{
          required: true,
          message: '请输入CPU序列号',
          trigger: 'blur'
        }],
        ipRules: [{
          validator: ipValidate,
          trigger: 'blur'
        }],
        macRules: [{
          validator: macValidate,
          trigger: 'blur'
        }]
      },
      btnLoading: false,
      url: null,
      form: {
        expiryTime: '',
        ipAddress: [{ value: '', key: Date.now() }],
        macAddress: [{ value: '', key: Date.now() + 1 }],
        cpuSerial: '',
        mainBoardSerial: ''
      }
    }
  },
  computed: {
    ipList () {
      return this.form.ipAddress.map(v => v.value)
    },
    macList () {
      return this.form.macAddress.map(mac => mac.value)
    }
  },
  methods: {
    removeBtn (index) {
      this.form.macAddress.splice(index, 1)
      this.form.ipAddress.splice(index, 1)
    },
    addBtn () {
      this.form.macAddress.push({value: '', key: Date.now()})
      this.form.ipAddress.push({value: '', key: Date.now() + 1})
    },
    times (address) { // 计算address中元素出现次数
      return address.reduce((res, c) => {
        res[c] ? res[c]++ : res[c] = 1
        return res
      }, {})
    },
    downLoad () {
      FetchDownLoadUrl(this.url)
        .then(res => {
          const { data } = res.data
          window.open(data.url, '_self')
        })
        .catch(error => {
          this.$message.error(error)
        })
    },
    confirm () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const { expiryTime, ...licenseCheckModel } = this.form
          this.btnLoading = true
          createLisence({ expiryTime, licenseCheckModel })
            .then(res => {
              const { data } = res.data
              this.url = data.downLoadUrl
              this.$message.success('文件生成成功')
            })
            .catch(error => {
              this.$message.error(error)
            })
            .then(() => {
              this.btnLoading = false
            })
        } else {
          return false
        }
      })
    },
    reset () {
      this.$refs.ruleForm.resetFields()
    }
  }
}
</script>
<style scoped>
.formContent {
  width: 600px;
  min-height: 700px;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 20px 70px 10px 30px;
}
.logoFont {
  text-align: left;
  padding-left: 40px;
  font-family: 'Times New Roman';
  font-size: 30px;
}
</style>
