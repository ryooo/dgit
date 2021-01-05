class GitApi
  def self.load_middleware!
    return unless Octokit.middleware.nil?
    stack = Faraday::RackBuilder.new do |builder|
      builder.use Faraday::HttpCache, serializer: Marshal, shared_cache: false
      builder.use Faraday::Request::Retry, exceptions: [Octokit::ServerError]
      builder.use Octokit::Middleware::FollowRedirects
      builder.use Octokit::Response::RaiseError
      builder.use Octokit::Response::FeedParser
      builder.response :logger
      builder.adapter Faraday.default_adapter
    end
    Octokit.middleware = stack
  end

  def self.client
    GitApi.load_middleware!
    @client ||= Octokit::Client.new(access_token: Rails.application.credentials.github[:access_token])
    # @client ||= Octokit::Client.new(
    #   client_id: Rails.application.credentials.github[:client_id],
    #   client_secret: Rails.application.credentials.github[:client_secret],
    # )
  end

  def self.respond_to_missing?(symbol, include_private)
    self.client.respond_to?(symbol, include_private)
  end

  def self.method_missing(method_name, *args)
    self.client.__send__(method_name, *args)
  rescue NoMethodError => e
    super
  end
end
