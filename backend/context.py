from contextvars import ContextVar
current_user = ContextVar('current_user', default='default')
