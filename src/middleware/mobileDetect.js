import MobileDetect from 'mobile-detect';

export const mobileAdapter = (req, res, next) => {
  const md = new MobileDetect(req.headers['user-agent']);
  
  res.locals.isMobile = md.mobile() !== null;
  res.locals.isTablet = md.tablet() !== null;
  
  next();
};