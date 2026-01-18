# Temporary SSL fix for development environment
# This disables SSL verification for jekyll-remote-theme downloads
require 'openssl'

# Monkey patch OpenSSL to disable certificate verification
module OpenSSL
  module SSL
    class SSLContext
      alias_method :original_set_params, :set_params

      def set_params(params = {})
        params[:verify_mode] ||= OpenSSL::SSL::VERIFY_NONE
        original_set_params(params)
      end
    end
  end
end

# Also patch Net::HTTP
require 'net/http'

module Net
  class HTTP
    alias_method :original_use_ssl=, :use_ssl=

    def use_ssl=(flag)
      self.original_use_ssl = flag
      if flag
        self.verify_mode = OpenSSL::SSL::VERIFY_NONE
      end
    end
  end
end

