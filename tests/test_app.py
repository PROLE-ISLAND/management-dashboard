"""基本的なアプリケーションテスト."""


def test_import_app():
    """アプリモジュールがインポートできることを確認."""
    from management_dashboard import management_dashboard

    assert management_dashboard is not None


def test_state_class_exists():
    """Stateクラスが存在することを確認."""
    from management_dashboard.management_dashboard import State

    assert State is not None


def test_index_function_exists():
    """indexページ関数が存在することを確認."""
    from management_dashboard.management_dashboard import index

    assert callable(index)
