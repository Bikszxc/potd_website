import { getServerStatus } from '@/utils/server-query';
import { getSaleStatus } from '@/utils/sale-query';
import HeaderWrapper from './header-wrapper';

export default async function Header() {
  const [status, isSaleActive] = await Promise.all([
    getServerStatus(),
    getSaleStatus()
  ]);

  return <HeaderWrapper status={status} isSaleActive={isSaleActive} />;
}
