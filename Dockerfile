FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy pre-built frontend (run `npm run build` locally first)
COPY dist/ /usr/share/nginx/html/

EXPOSE 3006

CMD ["nginx", "-g", "daemon off;"]
