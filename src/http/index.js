import axios from "axios"
import router from "@/router";
import { useCookies } from '@vueuse/integrations/useCookies'

const http = axios.create({
  //baseURL:请求的基本路径,将在每一次请求的url前面自动加，除非 url 是一个绝对 URL
  baseURL: 'http://localhost:8500',
  //timeout 指定请求超时的毫秒数,如果请求时间超过 timeout 的值，则请求会被中断
  timeout: 5000
})

// 添加请求拦截器
http.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  const cookie = useCookies()
  const token = cookie.get('Authorization')
  //如果token存在，将Authorization添加到请求头中
  if (token) {
    // config.headers.Authorization = `Bearer ${token}`
    config.headers.Authorization = `${token}`
  }
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
http.interceptors.response.use(function (response) {
  // 响应成功:2xx 范围内的状态码都会触发该函数。
  //如果响应数据是token无效，跳转登录页面
  if (response.data?.message === '会话无效') {
    router.push('/login')
    return Promise.reject(new Error("会话无效"));
  }
  // 对响应数据直接获取数据返回
  return response;
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误弹出统一的错误提示
  //ElMessage.error('请求失败:' + error.message)
  return Promise.reject(error);
});

export default http
