import Vue from 'vue'
import moment from 'moment'

Vue.filter('dateFormat', (milliseconds, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(milliseconds).format(pattern)
})
