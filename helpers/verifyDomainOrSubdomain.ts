export const verifyDomainOrSubdomain = ({
  domainNames,
  originHost,
}: {
  domainNames: Array<string>;
  originHost: string;
}) => {
  const foundDomainOrSubdomain = domainNames.find((domain) => {
    const domainArray = domain?.toLowerCase().split('.');
    const originHostArray = originHost?.toLowerCase().split('.');

    return domainArray.join('.') === originHostArray?.slice(originHostArray.length - domainArray.length).join('.');
  });

  return !!foundDomainOrSubdomain;
};
