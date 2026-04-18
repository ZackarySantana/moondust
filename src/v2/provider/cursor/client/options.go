package client

type Options struct {
	accessToken string

	usageEndpoint string
}

func defaultOptions() *Options {
	return &Options{
		usageEndpoint: "https://api2.cursor.sh/aiserver.v1.DashboardService/GetCurrentPeriodUsage",
	}
}

type Option func(*Options)

func WithAccessToken(accessToken string) Option {
	return func(o *Options) {
		o.accessToken = accessToken
	}
}

func WithUsageEndpoint(usageEndpoint string) Option {
	return func(o *Options) {
		o.usageEndpoint = usageEndpoint
	}
}
