export const verifyOrigins = ({ origins, originHost }: { origins: Array<string>; originHost: string }) => {
  return (
    originHost &&
    origins.some((item) => {
      return new RegExp(`\^${item.replace('*.', '(\\S.)*')}\$`, 'ig').test(originHost);
    })
  );
};
