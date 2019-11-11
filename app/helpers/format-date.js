import { helper } from '@ember/component/helper';
import dayjs      from 'dayjs'

/**
 * A date formatter
 *
 */
export function toggle([date, format]) {
  return dayjs(date).format(format);
}

export default helper(toggle);
