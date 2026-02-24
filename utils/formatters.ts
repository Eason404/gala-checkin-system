
/**
 * 安全助手：对敏感访问码进行脱敏处理
 * 防止管理员通过 UI 直接看到完整的 Staff/Admin Codes
 */
export const maskOperatorId = (id: string | undefined): string => {
  if (!id || id === 'NONE') return '-';
  if (id === 'PUBLIC') return 'Web/Public';
  if (id.length < 4) return id;
  return `${id[0]}***${id[id.length - 1]}`;
};
