<template>
  <section>
    <h3>许可协议</h3>
    <div class="formContent">
      <h1 class="logoFont">WHST<span style="color: #84c225">ONE</span></h1>
      <el-form label-width="120px" :model="form" style="margin-right: 20px;" size="medium" :rules="rules"
               ref="ruleForm">
        <el-form-item label="过期时间"
                      prop="expiryTime">
          <el-date-picker v-model="form.expiryTime"
                          type="datetime"
                          placeholder="请选择过期时间"
                          format="yyyy-MM-dd HH:mm:ss"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item v-for="(address, index) in form.ipAddress"
                      :prop="'ipAddress.' + index + '.value'"
                      :rules="{
                        required: true,
                        message: '请输入IP地址',
                        trigger: 'blur'
                      }"
                      :key="address.key"
                      :label="`IP地址${index+1}`">
          <el-row>
            <el-col :span="19">
              <el-input v-model="form.ipAddress[index].value"></el-input>
            </el-col>
            <el-col :span="1">
              <el-button type="text"
                         style="color: red"
                         @click.prevent="form.ipAddress.splice(index, 1)"
                         v-show="form.ipAddress.length !== 1">X</el-button>
            </el-col>
            <el-col :span="4" style="float: right">
              <el-button type="primary" icon="el-icon-plus"
                         @click.prevent="form.ipAddress.push({value: '', key: Date.now()})"
                         v-show="index + 1 === form.ipAddress.length"
                         style="float: right"></el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-for="(address, index) in form.macAddress"
                      :prop="'macAddress.' + index + '.value'"
                      :key="address.key"
                      :rules="{
                        required: true,
                        message: '请输入MAC地址',
                        trigger: 'blur'
                      }"
                      :label="`Mac地址${index+1}`">
          <el-row>
            <el-col :span="19">
              <el-input v-model="form.macAddress[index].value"></el-input>
            </el-col>
            <el-col :span="1">
              <el-button type="text"
                         style="color: red"
                         @click.prevent="form.macAddress.splice(index, 1)"
                         v-show="form.macAddress.length !== 1">X</el-button>
            </el-col>
            <el-col :span="4" style="float: right">
              <el-button type="primary" icon="el-icon-plus"
                         @click.prevent="form.macAddress.push({value: '', key: Date.now() + 1})"
                         v-show="index + 1 === form.macAddress.length"
                         style="float: right"></el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="CPU序列号"
                      prop="cpuSerial">
          <el-input v-model="form.cpuSerial"></el-input>
        </el-form-item>
        <el-form-item label="主板序列号"
                      prop="mainBoardSerial">
          <el-input v-model="form.mainBoardSerial"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="20">
            <el-button style="float: right"
                       @click="reset"
                       size="medium">重置</el-button>
          </el-col>
          <el-col :span="4">
            <el-button style="float: right"
                       type="primary"
                       v-if="downLoadBtn"
                       @click="downLoad"
                       size="medium">下载</el-button>
            <el-button style="float: right"
                       type="primary"
                       :loading="btnLoading"
                       @click="confirm"
                       v-else
                       size="medium">生成</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </section>
</template>
<script>
import { createLisence } from '@/api/lisence'
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
    const baseData = {
      expiryTime: '',
      ipAddress: [{ value: '', key: Date.now() }],
      macAddress: [{ value: '', key: Date.now() + 1 }],
      cpuSerial: '',
      mainBoardSerial: ''
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
        }]
      },
      btnLoading: false,
      url: null,
      downLoadBtn: false,
      form: JSON.parse(JSON.stringify(baseData)),
      baseForm: JSON.parse(JSON.stringify(baseData))
    }
  },
  methods: {
    downLoad () {
      window.open(this.url, '_self')
      // let eleLink = document.createElement('a');
      // eleLink.href = this.url;
      // eleLink.download = "file.lic";
      // document.body.appendChild(eleLink);
      // eleLink.click();
      // document.body.removeChild(eleLink);
    },
    confirm () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const { ipAddress, macAddress, expiryTime, ...other } = this.form
          const licenseCheckModel = {
            ...other,
            ipAddress: ipAddress.map(ip => ip.value),
            macAddress: macAddress.map(ip => ip.value)
          }
          this.btnLoading = true
          createLisence({ expiryTime, licenseCheckModel })
            .then(res => {
              const { data: url } = res.data
              this.url = url
              this.downLoadBtn = true
              this.$message.success('文件生成成功!')
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
      this.form = JSON.parse(JSON.stringify(this.baseForm))
      this.$refs.ruleForm.clearValidate()
      this.downLoadBtn = false
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
  padding: 20px 70px 10px 0;
}
.logoFont {
  text-align: left;
  padding-left: 40px;
  font-family: 'Times New Roman';
  font-size: 30px;
}
</style>
