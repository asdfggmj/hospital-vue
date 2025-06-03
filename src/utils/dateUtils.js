// 格式化时间工具类
import dayjs from 'dayjs';

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return date ? dayjs(date).format(format) : '--';
};
