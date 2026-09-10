<LottieView autoPlay loop={false}
  onAnimationFinish={(isCancelled) => {
    if (isCancelled === false) onComplete();
  }}
  source={require("../../assets/splash/animation.json")} />
