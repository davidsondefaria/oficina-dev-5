ARG VARIANT=1.109.2

FROM n8nio/n8n:${VARIANT}

EXPOSE 5678

ENV ENABLE_ALPINE_PRIVATE_NETWORKING=true
ENV NODE_FUNCTION_ALLOW_EXTERNAL='*'
ENV NODE_FUNCTION_ALLOW_BUILTIN='*'

# RUN yarn global add date-fns date-fns-tz node-postgres qs string-similarity @lfreneda/eh-dia-util html-pdf-node
USER root
RUN npm i -g date-fns date-fns-tz node-postgres qs string-similarity @lfreneda/eh-dia-util html-pdf-node cpf-cnpj-validator exifreader piexif node-html-to-image@5.0.0 pdf2pic
