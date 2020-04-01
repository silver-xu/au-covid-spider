import { Stats } from '../types/stats';
import omit from 'lodash.omit';

export const mapStats = (resp: any): Stats => {
  const stats = resp.stats as Stats;
  return omit(stats, 'breakdowns');
};
